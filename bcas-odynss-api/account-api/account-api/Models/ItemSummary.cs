namespace account_api.Models
{
    public class ItemSummary
    {
        public string item_name { get; set; }
        public string item_desc { get; set; }
        public int qty { get; set; }
        public int stock { get; set; }

        // Additional properties for expanded row details
        public string item_uid { get; set; }

        public string remarks { get; set; }
        public DateTime invTime { get; set; }
        public string invBy { get; set; }
        public bool isOut { get; set; }
        public string borrowBy { get; set; }
        public string location { get; set; }
    }
}
