const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
// ミドルウェア
app.use(cors());
app.use(express.json());
let contacts = [];
// API
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    // バリデーション
    if (!name || !email || !message) {
        return res.status(400).json({ error: "入力不正"});
    }
    const newContact = {
        // 現在時刻をミリ秒で一意なIDとして使用
        id: Date.now(),
        // name:nameの省略記法
        name,
        // email:emailの省略記法
        email,
        // message:messageの省略記法
        message,
        // 受信日時を記録
        createdAt: new Date(),
    };
    contacts.push(newContact);
    console.log("受信:", newContact);
    res.status(200).json({ success: true });
});
// 一覧取得
app.get("/api/contact", (req, res) => {
    res.json(contacts);
});
// 起動
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});