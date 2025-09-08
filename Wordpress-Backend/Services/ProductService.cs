using ProductAPI.Models;
using System.Globalization;

namespace ProductAPI.Services
{
    public class ProductService
    {
        private readonly List<Product> _products = new()
        {
            new Product { Id = 1, Domain = new Domain { Name = "Automation" }, Title = "WorkFlow Automator", Caption = "...", Image = "..." },
            // Add more initial products if needed
        };

        public List<Product> GetAll() => _products;
        
        public List<Product> GetByDomain(string domain) =>
            _products.Where(p => 
                string.Equals(p.Domain?.Name, domain, StringComparison.OrdinalIgnoreCase))
                .ToList();
                
        public Product? GetById(int id) => _products.FirstOrDefault(p => p.Id == id);
        
        public void Add(Product product)
        {
            product.Id = _products.Any() ? _products.Max(p => p.Id) + 1 : 1;
            _products.Add(product);
        }
        public bool Update(int id, Product updated)
        {
            var index = _products.FindIndex(p => p.Id == id);
            if (index == -1) return false;
            updated.Id = id;
            _products[index] = updated;
            return true;
        }
        public bool Delete(int id)
        {
            var product = GetById(id);
            if (product == null) return false;
            _products.Remove(product);
            return true;
        }
    }
}
