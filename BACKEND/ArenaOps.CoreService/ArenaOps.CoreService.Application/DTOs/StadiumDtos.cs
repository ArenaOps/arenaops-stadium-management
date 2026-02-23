using System;
using System.ComponentModel.DataAnnotations;

namespace ArenaOps.CoreService.Application.DTOs;

public class StadiumDto
{
    public Guid StadiumId { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateStadiumDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(300, MinimumLength = 1)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string State { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Country { get; set; } = string.Empty;

    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Pincode { get; set; } = string.Empty;

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}

public class UpdateStadiumDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(300, MinimumLength = 1)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string State { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Country { get; set; } = string.Empty;

    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Pincode { get; set; } = string.Empty;

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public bool IsActive { get; set; }
}
