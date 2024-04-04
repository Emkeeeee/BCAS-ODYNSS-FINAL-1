namespace account_api.Models
{
    public class InventoryModel
    {
        public string itemUid { get; set; }
        public string itemName { get; set; }
        public string itemDesc { get; set;}
        public string remarks { get; set; }
        public int deptId { get; set; }
        public int catId { get; set; }
        public int subCatId { get; set; }
        public int unqFeatId { get; set; }
        public string unqFeature { get; set; }
        public int invBy { get; set; }
        public int locId { get; set; }

    }
}
