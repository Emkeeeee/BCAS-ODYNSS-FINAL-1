namespace account_api.Models
{
    public class InventoryDataModel
    {
        public int Id { get; set; }
        public string TableName { get; set; }
        public Dictionary<string, object> Fields { get; set; }
    }
}
