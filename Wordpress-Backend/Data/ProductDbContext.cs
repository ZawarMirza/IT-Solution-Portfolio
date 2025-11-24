using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProductAPI.Models;
using Wordpress_Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace ProductAPI.Data
{
    public class ProductDbContext : IdentityDbContext<ApplicationUser>
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Domain> Domains { get; set; }
        public DbSet<Publication> Publications { get; set; }
        public DbSet<Repository> Repositories { get; set; }
        public DbSet<PremiumRepositoryRequest> PremiumRepositoryRequests { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<FooterSettings> FooterSettings { get; set; }
        public DbSet<Solution> Solutions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure ApplicationUser properties
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(u => u.FirstName).HasMaxLength(100);
                entity.Property(u => u.LastName).HasMaxLength(100);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(u => u.VerificationTokenHash).HasMaxLength(256);
            entity.Property(u => u.VerificationTokenExpiresAt);
            entity.Property(u => u.EmailVerifiedAt);
            entity.Property(u => u.LastVerificationEmailSentAt);
            entity.Property(u => u.BlockReason).HasMaxLength(500);
            entity.Property(u => u.BlockedAt);
            entity.Property(u => u.BlockedBy).HasMaxLength(450);
            });

            // Configure Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Title).IsRequired().HasMaxLength(255);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                // Relationships
                entity.HasOne(p => p.Domain)
                    .WithMany(d => d.Products)
                    .HasForeignKey(p => p.DomainId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.CreatedBy)
                    .WithMany(u => u.Products)
                    .HasForeignKey(p => p.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Domain
            modelBuilder.Entity<Domain>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
                entity.HasIndex(d => d.Name).IsUnique();
            });

            // Configure Publication
            modelBuilder.Entity<Publication>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Title).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Authors).IsRequired();
                entity.Property(p => p.Domain).IsRequired().HasMaxLength(50);
                entity.Property(p => p.Abstract).IsRequired();
                entity.Property(p => p.Keywords).IsRequired();
                entity.Property(p => p.Status).IsRequired().HasMaxLength(20);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Configure Repository
            modelBuilder.Entity<Repository>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Name).IsRequired().HasMaxLength(200);
                entity.Property(r => r.Description).IsRequired();
                entity.Property(r => r.Domain).IsRequired().HasMaxLength(50);
                entity.Property(r => r.Category).IsRequired().HasMaxLength(20);
                entity.Property(r => r.Technologies).IsRequired();
                entity.Property(r => r.Status).IsRequired().HasMaxLength(20);
                entity.Property(r => r.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(r => r.LastUpdated).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Configure PremiumRepositoryRequest
            modelBuilder.Entity<PremiumRepositoryRequest>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.UserId).IsRequired().HasMaxLength(450);
                entity.Property(r => r.Status).IsRequired().HasMaxLength(20).HasDefaultValue("pending");
                entity.Property(r => r.Message).HasMaxLength(500);
                entity.Property(r => r.AdminNotes).HasMaxLength(1000);
                entity.Property(r => r.RequestedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                // Relationships
                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(r => r.Repository)
                    .WithMany()
                    .HasForeignKey(r => r.RepositoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.UserId).IsRequired().HasMaxLength(450);
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.Comment).HasMaxLength(2000);
                entity.Property(r => r.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                // Relationships
                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(r => r.Repository)
                    .WithMany()
                    .HasForeignKey(r => r.RepositoryId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                // Prevent duplicate reviews from same user for same repository
                entity.HasIndex(r => new { r.UserId, r.RepositoryId }).IsUnique();
            });

            // Configure Feedback
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(f => f.LastName).IsRequired().HasMaxLength(100);
                entity.Property(f => f.WorkEmail).IsRequired().HasMaxLength(255);
                entity.Property(f => f.CompanyName).IsRequired().HasMaxLength(200);
                entity.Property(f => f.Country).IsRequired().HasMaxLength(100);
                entity.Property(f => f.HowCanWeHelp).IsRequired().HasMaxLength(2000);
                entity.Property(f => f.ProductServiceInterest).IsRequired().HasMaxLength(100);
                entity.Property(f => f.HowDidYouHearAboutUs).IsRequired().HasMaxLength(100);
                entity.Property(f => f.SubmittedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Configure Solutions
            modelBuilder.Entity<Solution>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Title).IsRequired().HasMaxLength(200);
                entity.Property(s => s.Subtitle).HasMaxLength(300);
                entity.Property(s => s.Icon).HasMaxLength(200);
                entity.Property(s => s.ImageUrl).HasMaxLength(500);
                entity.Property(s => s.ActionText).HasMaxLength(100);
                entity.Property(s => s.ActionUrl).HasMaxLength(500);
                entity.Property(s => s.Tags).HasColumnType("TEXT");
                entity.Property(s => s.Features).HasColumnType("TEXT");
                entity.Property(s => s.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(s => s.Domain)
                    .WithMany()
                    .HasForeignKey(s => s.DomainId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.CreatedBy)
                    .WithMany()
                    .HasForeignKey(s => s.CreatedById)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure FooterSettings
            modelBuilder.Entity<FooterSettings>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Configure Identity table names
            modelBuilder.Entity<IdentityRole>().ToTable("AspNetRoles");
            modelBuilder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles");
            modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims");
            modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins");
            modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims");
            modelBuilder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens");
        }
    }
}
