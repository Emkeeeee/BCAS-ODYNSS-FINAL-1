namespace account_api.Models
{
    public class BorrowModel
    {
        public string item_uid { get; set; }
        public string borrow_name { get; set; }
        public int loc_id { get; set; }
        public int user_id { get; set; }
    }
}
