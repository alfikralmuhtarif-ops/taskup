using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskUp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDisabled",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemAdmin",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDisabled",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsSystemAdmin",
                table: "Users");
        }
    }
}
