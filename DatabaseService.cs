

using Microsoft.EntityFrameworkCore;

namespace TrajetCalculator
{
    public class DatabaseService(TrajetCalculatorDbContext context)
    {
        private readonly TrajetCalculatorDbContext _context = context;
        public async Task<List<Commune>> GetCommunesAsync()
        {
            return await _context.Communes
                .ToListAsync();
        }
    }
}