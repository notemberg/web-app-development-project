using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MaJerGan.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipant_Users_UserId",
                table: "EventParticipant");

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipant_Users_UserId",
                table: "EventParticipant",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipant_Users_UserId",
                table: "EventParticipant");

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipant_Users_UserId",
                table: "EventParticipant",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
