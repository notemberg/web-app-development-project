using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaJerGan.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationNameToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocationName",
                table: "Events",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocationName",
                table: "Events");
        }
    }
}
