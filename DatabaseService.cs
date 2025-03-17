

using Microsoft.EntityFrameworkCore;

namespace TrajetCalculator
{
    public class DatabaseService
    {
        private readonly TrajetCalculatorDbContext _context;

        public DatabaseService(TrajetCalculatorDbContext context)
        {
            _context = context;
        }

        public async Task<List<Commune>> GetCommunesAsync()
        {
            return await _context.Communes.ToListAsync();
        }
    }
}
