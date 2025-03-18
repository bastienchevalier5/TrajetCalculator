using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.JSInterop;
namespace TrajetCalculator
{


    public class MapService
    {
        private readonly IJSRuntime _jsRuntime;

        public MapService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        // Appelle la fonction JavaScript `addPins` en lui passant la liste des villes sélectionnées
        public async Task AjouterMarqueursAsync(List<Commune> villes)
        {
            await _jsRuntime.InvokeVoidAsync("addPins", villes);
        }
    }
}

