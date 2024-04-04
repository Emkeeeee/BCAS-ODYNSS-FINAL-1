namespace account_api.Models
{
    public class SubCategory
    {
        public int subCat_id { get; set; }
        public int cat_id { get; set; }
        public string subCategory { get; set; }
        public string acronym { get; set; }
        public bool isActive { get; set; }
    }
}
