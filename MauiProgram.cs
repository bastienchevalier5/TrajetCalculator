using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace TrajetCalculator
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                })
                .UseMauiMaps();

            builder.Services.AddMauiBlazorWebView();

            var connectionString = "server=127.0.0.1;port=3306;database=TrajetCalculator;user=root;password=;";

            builder.Services.AddDbContext<TrajetCalculatorDbContext>(options =>
            {
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
                       .LogTo(Console.WriteLine, LogLevel.Information); // Active les logs détaillés
            });


            builder.Services.AddScoped<DatabaseService>();
            builder.Services.AddScoped<MapService>();


#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
