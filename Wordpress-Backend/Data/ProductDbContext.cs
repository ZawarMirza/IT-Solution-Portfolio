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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure ApplicationUser properties
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(u => u.FirstName).HasMaxLength(100);
                entity.Property(u => u.LastName).HasMaxLength(100);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
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
