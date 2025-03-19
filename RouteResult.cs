using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TrajetCalculator
{
    public class RouteResult
    {
        public double TotalDistance { get; set; }
        public Dictionary<string, Dictionary<string, double>> DistanceMatrix { get; set; }
        public List<Commune> Route { get; set; }


        public RouteResult()
        {
            TotalDistance = 0;
            DistanceMatrix = new Dictionary<string, Dictionary<string, double>>();
            Route = new List<Commune>();
        }
    }
}
