namespace account_api.Models
{
    public class RequestModel
    {
        public string item_uid { get; set; }
        public int requester_id { get; set; }
        public string borrower { get; set; }
        public int dept_id { get; set; }
        public int loc_id { get; set; }
    }
}
