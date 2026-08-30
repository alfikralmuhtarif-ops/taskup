using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskUp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContentEncrypted = table.Column<string>(type: "text", nullable: false),
                    IsPinned = table.Column<bool>(type: "boolean", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tags_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NoteTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NoteId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoteTags_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoteTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_DeletedAt",
                table: "Notes",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_TaskId",
                table: "Notes",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId_DeletedAt_UpdatedAt",
                table: "Notes",
                columns: new[] { "UserId", "DeletedAt", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_NoteTags_NoteId_TagId",
                table: "NoteTags",
                columns: new[] { "NoteId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoteTags_TagId",
                table: "NoteTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_UserId_Name",
                table: "Tags",
                columns: new[] { "UserId", "Name" },
                unique: true);

            // Row-Level Security, defense-in-depth on top of NoteAuthorizationService's C#-level
            // ownership checks (see NoteRlsActionFilter and SECURITY.md for the owner-role
            // caveat: this does not yet restrict the app's own DB role, which owns these
            // tables — it protects against any other role, e.g. a future read-only reporting
            // role, and becomes a hard boundary once the app connects as a non-owner role).
            migrationBuilder.Sql(
                """
                ALTER TABLE "Notes" ENABLE ROW LEVEL SECURITY;
                ALTER TABLE "Notes" FORCE ROW LEVEL SECURITY;
                CREATE POLICY notes_isolation ON "Notes"
                    USING ("UserId" = current_setting('app.current_user_id', true)::uuid)
                    WITH CHECK ("UserId" = current_setting('app.current_user_id', true)::uuid);

                ALTER TABLE "Tags" ENABLE ROW LEVEL SECURITY;
                ALTER TABLE "Tags" FORCE ROW LEVEL SECURITY;
                CREATE POLICY tags_isolation ON "Tags"
                    USING ("UserId" = current_setting('app.current_user_id', true)::uuid)
                    WITH CHECK ("UserId" = current_setting('app.current_user_id', true)::uuid);

                ALTER TABLE "NoteTags" ENABLE ROW LEVEL SECURITY;
                ALTER TABLE "NoteTags" FORCE ROW LEVEL SECURITY;
                CREATE POLICY note_tags_isolation ON "NoteTags"
                    USING (EXISTS (
                        SELECT 1 FROM "Notes"
                        WHERE "Notes"."Id" = "NoteTags"."NoteId"
                          AND "Notes"."UserId" = current_setting('app.current_user_id', true)::uuid
                    ))
                    WITH CHECK (EXISTS (
                        SELECT 1 FROM "Notes"
                        WHERE "Notes"."Id" = "NoteTags"."NoteId"
                          AND "Notes"."UserId" = current_setting('app.current_user_id', true)::uuid
                    ));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP POLICY IF EXISTS note_tags_isolation ON "NoteTags";
                DROP POLICY IF EXISTS tags_isolation ON "Tags";
                DROP POLICY IF EXISTS notes_isolation ON "Notes";
                """);

            migrationBuilder.DropTable(
                name: "NoteTags");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Tags");
        }
    }
}
