/*
================================================================================
SCRIPT: Seating Hold Mechanism Schema & Unified Stored Procedure
DESCRIPTION: Consolidates HOLD, CLEANUP, and CONFIRM operations into one SP.
================================================================================
*/

-- 1. SCHEMA CHANGES
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Events')
BEGIN
    CREATE TABLE [dbo].[Events] (
        [EventId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        [StadiumId] UNIQUEIDENTIFIER NOT NULL,
        [SeatingPlanId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [StartTime] DATETIME2 NOT NULL,
        [IsLive] BIT DEFAULT 0,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EventSeats')
BEGIN
    CREATE TABLE [dbo].[EventSeats] (
        [EventSeatId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
        [EventId] UNIQUEIDENTIFIER NOT NULL,
        [SeatId] UNIQUEIDENTIFIER NOT NULL,
        [Status] TINYINT NOT NULL DEFAULT 0, -- 0: Available, 1: Held, 2: Confirmed
        [Price] DECIMAL(18, 2) NOT NULL,
        [HeldByUserId] UNIQUEIDENTIFIER NULL,
        [HoldExpiresAtUtc] DATETIME2 NULL,
        CONSTRAINT FK_EventSeats_Events FOREIGN KEY ([EventId]) REFERENCES [dbo].[Events]([EventId])
    );
    CREATE INDEX IX_EventSeats_EventId ON [dbo].[EventSeats]([EventId]);
    CREATE INDEX IX_EventSeats_Status ON [dbo].[EventSeats]([Status]) WHERE [Status] = 1;
END
GO

-- 2. UNIFIED STORED PROCEDURE

-- -----------------------------------------------------------------------------
-- sp_ManageSeating: Single entry point for all seat status operations
-- Actions: 'HOLD', 'CLEANUP', 'CONFIRM'
-- 
-- RECOMMENDATION: The calling Repository/Service should handle Status = 2 
-- (Business Rule Violation) by throwing a custom exception (e.g., ConflictException)
-- to ensure the API returns a meaningful error message to the client.
-- -----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[sp_ManageSeating]
    @Action NVARCHAR(20),
    @UserId UNIQUEIDENTIFIER = NULL,
    @HoldDurationSeconds INT = 600,
    @EventId UNIQUEIDENTIFIER = NULL,
    @EventSeatId UNIQUEIDENTIFIER = NULL,
    @EventSeatIds NVARCHAR(MAX) = NULL -- Comma-separated GUIDs for bulk confirm
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Status INT = 0; -- 0: Success, 1: Error, 2: Business Rule Violation
    DECLARE @Message NVARCHAR(500) = '';
    DECLARE @AffectedCount INT = 0;

    BEGIN TRY
        BEGIN TRANSACTION;

        ----------------------------------------------------------------------
        -- ACTION: HOLD
        ----------------------------------------------------------------------
        IF @Action = 'HOLD'
        BEGIN
            IF @EventSeatId IS NULL OR @UserId IS NULL OR @EventId IS NULL
            BEGIN
                SET @Status = 2;
                SET @Message = 'EventId, EventSeatId and UserId are required for HOLD action.';
            END
            ELSE
            BEGIN
                UPDATE dbo.EventSeats WITH (ROWLOCK, UPDLOCK)
                SET Status = 1,
                    HeldByUserId = @UserId,
                    HoldExpiresAtUtc = DATEADD(SECOND, @HoldDurationSeconds, GETUTCDATE())
                WHERE EventSeatId = @EventSeatId
                  AND EventId = @EventId
                  AND (
                        Status = 0
                        OR (Status = 1 AND HoldExpiresAtUtc < GETUTCDATE())
                      );

                SET @AffectedCount = @@ROWCOUNT;

                IF @AffectedCount = 0
                BEGIN
                    SET @Status = 2;
                    SET @Message = 'Seat is already held or confirmed by another user.';
                END
                ELSE
                BEGIN
                    SET @Message = 'Seat held successfully.';
                END
            END
        END

        ----------------------------------------------------------------------
        -- ACTION: CLEANUP (release expired holds)
        ----------------------------------------------------------------------
        ELSE IF @Action = 'CLEANUP'
        BEGIN
            UPDATE dbo.EventSeats
            SET Status = 0,
                HeldByUserId = NULL,
                HoldExpiresAtUtc = NULL
            WHERE Status = 1
              AND HoldExpiresAtUtc < GETUTCDATE();

            SET @AffectedCount = @@ROWCOUNT;
            SET @Message = CAST(@AffectedCount AS NVARCHAR(10)) + ' expired holds released.';
        END

        ----------------------------------------------------------------------
        -- ACTION: CONFIRM
        ----------------------------------------------------------------------
        ELSE IF @Action = 'CONFIRM'
        BEGIN
            IF @UserId IS NULL OR @EventSeatIds IS NULL OR @EventId IS NULL
            BEGIN
                SET @Status = 2;
                SET @Message = 'EventId, UserId and EventSeatIds are required for CONFIRM action.';
            END
            ELSE
            BEGIN
                ;WITH ParsedSeats AS
                (
                    SELECT TRY_CAST(value AS UNIQUEIDENTIFIER) AS EventSeatId
                    FROM STRING_SPLIT(@EventSeatIds, ',')
                    WHERE TRY_CAST(value AS UNIQUEIDENTIFIER) IS NOT NULL
                )
                UPDATE es
                SET es.Status = 2,
                    es.HoldExpiresAtUtc = NULL
                FROM dbo.EventSeats es
                INNER JOIN ParsedSeats ps ON es.EventSeatId = ps.EventSeatId
                WHERE es.EventId = @EventId
                  AND es.HeldByUserId = @UserId
                  AND es.Status = 1
                  AND es.HoldExpiresAtUtc >= GETUTCDATE(); -- Critical expiry validation

                SET @AffectedCount = @@ROWCOUNT;
                SET @Message = CAST(@AffectedCount AS NVARCHAR(10)) + ' seats confirmed successfully.';
            END
        END

        ----------------------------------------------------------------------
        -- INVALID ACTION
        ----------------------------------------------------------------------
        ELSE
        BEGIN
            SET @Status = 2;
            SET @Message = 'Invalid action specified. Use HOLD, CLEANUP, or CONFIRM.';
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @Status = 1;
        SET @Message = ERROR_MESSAGE();
    END CATCH;

    SELECT @Status AS [Status],
           @Message AS [Message],
           @AffectedCount AS [AffectedCount];
END
GO
