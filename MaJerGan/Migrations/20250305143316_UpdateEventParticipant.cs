using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaJerGan.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEventParticipant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllowedGenders",
                table: "Events",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsGenderRestricted",
                table: "Events",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresConfirmation",
                table: "Events",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RejectedReason",
                table: "EventParticipants",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedGenders",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "IsGenderRestricted",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RequiresConfirmation",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RejectedReason",
                table: "EventParticipants");
        }
    }
}
