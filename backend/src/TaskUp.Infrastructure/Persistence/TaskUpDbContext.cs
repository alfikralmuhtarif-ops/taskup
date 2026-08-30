using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TaskUp.Application.Abstractions;
using TaskUp.Domain.Admin;
using TaskUp.Domain.Ai;
using TaskUp.Domain.Chat;
using TaskUp.Domain.Identity;
using TaskUp.Domain.Invites;
using TaskUp.Domain.Notes;
using TaskUp.Domain.Notifications;
using TaskUp.Domain.Projects;
using TaskUp.Domain.Shared;
using TaskUp.Domain.Tasks;

namespace TaskUp.Infrastructure.Persistence;

public class TaskUpDbContext(DbContextOptions<TaskUpDbContext> options, IFieldEncryptionService fieldEncryption) : DbContext(options)
{
    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<OtpRequest> OtpRequests => Set<OtpRequest>();
    public DbSet<Consent> Consents => Set<Consent>();
    public DbSet<UserBlock> UserBlocks => Set<UserBlock>();
    public DbSet<UserReport> UserReports => Set<UserReport>();

    // Admin
    public DbSet<AdminAccessLog> AdminAccessLogs => Set<AdminAccessLog>();

    // Projects
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();

    // Tasks
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<TaskParticipant> TaskParticipants => Set<TaskParticipant>();
    public DbSet<TaskChecklistItem> TaskChecklistItems => Set<TaskChecklistItem>();
    public DbSet<TaskUpdate> TaskUpdates => Set<TaskUpdate>();
    public DbSet<TaskActivity> TaskActivities => Set<TaskActivity>();

    // Shared
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<Mention> Mentions => Set<Mention>();

    // Chat
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    // Invites
    public DbSet<Invite> Invites => Set<Invite>();

    // Notes
    public DbSet<Note> Notes => Set<Note>();

    // Notifications
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<NotificationDeliverySettings> NotificationDeliverySettings => Set<NotificationDeliverySettings>();

    // Ai
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<AIFeatureTrialUsage> AIFeatureTrialUsages => Set<AIFeatureTrialUsage>();
    public DbSet<AITaskSummary> AITaskSummaries => Set<AITaskSummary>();
    public DbSet<AIRiskFlag> AIRiskFlags => Set<AIRiskFlag>();
    public DbSet<AISuggestion> AISuggestions => Set<AISuggestion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TaskUpDbContext).Assembly);

        // Transparent field-level encryption (AES-256-GCM) for the two columns approved for it —
        // applied here rather than in the per-entity IEntityTypeConfiguration classes because
        // ApplyConfigurationsFromAssembly instantiates those via a parameterless constructor and
        // can't receive the injected IFieldEncryptionService. Every other line of C# that reads
        // User.Phone / Message.Text keeps working unchanged: EF converts at the SQL boundary.
        var encryptedString = new ValueConverter<string, string>(
            plain => fieldEncryption.Encrypt(plain),
            stored => fieldEncryption.Decrypt(stored));

        var encryptedNullableString = new ValueConverter<string?, string?>(
            plain => plain == null ? null : fieldEncryption.Encrypt(plain),
            stored => stored == null ? null : fieldEncryption.Decrypt(stored));

        modelBuilder.Entity<User>().Property(u => u.Phone).HasConversion(encryptedString);
        modelBuilder.Entity<Message>().Property(m => m.Text).HasConversion(encryptedNullableString);
        modelBuilder.Entity<Note>().Property(n => n.Title).HasConversion(encryptedString);
        modelBuilder.Entity<Note>().Property(n => n.Content).HasConversion(encryptedString).HasColumnName("ContentEncrypted");

        base.OnModelCreating(modelBuilder);
    }
}
