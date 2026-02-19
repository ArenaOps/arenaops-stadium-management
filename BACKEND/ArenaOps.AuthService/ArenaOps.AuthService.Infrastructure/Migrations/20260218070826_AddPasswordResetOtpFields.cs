using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArenaOps.AuthService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetOtpFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetOtpExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetOtpHash",
                table: "Users",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetOtpExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetOtpHash",
                table: "Users");
        }
    }
}
