namespace account_api.Models
{
    public class RequestBorrowModel
    {
        public string item_uid { get; set; }
        public string borrower { get; set; }
        public int loc_id { get; set; }
        public int requester_id { get; set; }
        public int rq_id { get; set; }
    }
}
