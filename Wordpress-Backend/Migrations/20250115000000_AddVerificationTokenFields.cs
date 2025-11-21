using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Wordpress_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificationTokenFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VerificationTokenHash",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationTokenExpiresAt",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailVerifiedAt",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastVerificationEmailSentAt",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerificationTokenHash",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "VerificationTokenExpiresAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "EmailVerifiedAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastVerificationEmailSentAt",
                table: "AspNetUsers");
        }
    }
}
