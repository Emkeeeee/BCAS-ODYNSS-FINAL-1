namespace account_api.Models
{
    public class InventoryDataModel
    {
        public string old_item_uid {  get; set; }
        public string item_uid {get; set;}
        public string item_name { get; set; }
        public string item_desc { get; set; }
        public string remarks { get; set; }
        public int dept_id { get; set; }
        public int cat_id { get; set; }
        public int subCat_id { get; set; }
        public int unqFeat_id { get; set; }
        public string unqFeat { get; set; }
        public int invBy { get; set; }
        public int loc_id { get; set; }
    }
}
