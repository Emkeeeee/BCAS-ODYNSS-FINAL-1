namespace account_api.Models
{
    public class BorrowHistoryItem
    {
        public int brw_id { get; set; }
        public string dept_handler { get; set; }
        public string item_uid { get; set; }
        public DateTime brw_time { get; set; }
        public string borrower { get; set; }
        public string location { get; set; }
        public bool isActive { get; set; }
    }
}
