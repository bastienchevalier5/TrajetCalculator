using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TrajetCalculator
{
    public class TrajetCalculatorDbContext : DbContext
    {
        public TrajetCalculatorDbContext(DbContextOptions<TrajetCalculatorDbContext> options) : base(options) { }

        public DbSet<Commune> Communes { get; set; }
    }

    [Table("communes")]
    public class Commune
    {
        [Key]
        [Column("insee_code")]
        public string? InseeCode { get; set; }

        [Column("city_code")]
        public string? CityCode { get; set; }

        [Column("zip_code")]
        public string? ZipCode { get; set; }

        [Column("label")]
        public string? Label { get; set; }

        [Column("latitude")]
        public decimal? Latitude { get; set; }

        [Column("longitude")]
        public decimal? Longitude { get; set; }

        [Column("department_name")]
        public string? DepartmentName { get; set; }

        [Column("department_number")]
        public string? DepartmentNumber { get; set; }

        [Column("region_name")]
        public string? RegionName { get; set; }

        [Column("region_geojson_name")]
        public string? RegionGeojsonName { get; set; }
    }
}
