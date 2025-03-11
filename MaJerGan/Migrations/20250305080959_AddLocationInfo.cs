using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaJerGan.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocationAddress",
                table: "Events",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LocationImage",
                table: "Events",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocationAddress",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "LocationImage",
                table: "Events");
        }
    }
}
