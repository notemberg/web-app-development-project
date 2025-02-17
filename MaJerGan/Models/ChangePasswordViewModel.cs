using System.ComponentModel.DataAnnotations;

public class ChangePasswordViewModel
{
    [Required]
    public int UserId { get; set; } // ใช้ ID ของ User

    [Required, DataType(DataType.Password)]
    public string OldPassword { get; set; }

    [Required, DataType(DataType.Password)]
    // [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string NewPassword { get; set; }

    [Required, DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; }
}
