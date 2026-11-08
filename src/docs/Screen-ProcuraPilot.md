Here is the complete, compiled master blueprint for **ProcuraPilot (https://wander-pocket-s2h8.here.now/ProcuraPilot.png) (284*158px) by zercommit (https://worker.github-ji.pages.dev/zerocommit.svg 1:1 - zerocommit log )**.

### Screen 1: Login (Pehchan)
* **Kyun chahiye:** Jab kal ko 50 hazar dollar ka ghotala ho, to pata hona chahiye ke system mein kon ghusa tha. Koi anonymous kaam nahi hoga.
* **Input:** User ki identity aur password.
* **Output:** User ko do mein se aik taqat milti hai:
  * Ya to wo sirf ghaltiyan dhoond sakta hai (*Inspector*).
  * Ya wo ghaltiyon ke bawajood payment approve kar sakta hai (*Boss*).

---

### Screen 2: Intake & Queue (Kachra Jama Karne Ki Jagah)
* **Kyun chahiye:** Naye documents system ko khilana aur un bills ki list dekhna jo math test mein fail ho chuke hain.
* **Input:** Do files—Asal Order aur Vendor ka Bheja hua Bill.
* **Logic:** Machine dono ko parhti hai. Agar aik rupay ka bhi farq nikla, to bill is queue mein phans jata hai.
* **Display Data:** Vendor ka naam, kitne paise ka jhol hai, aur kitne items mismatch hain.
* **Action:** Kisi bhi phanse huye bill ko open karke agli screen par inspection ke liye bhejna.

---

### Screen 3: Comparison & Dispute (Jhoot Pakadne Ka Adda)
* **Kyun chahiye:** Yahan faisla hota hai ke vendor ko paise dene hain ya usko bhagana hai.
* **Input:** Asal order ke numbers aur bill ke numbers ka aamna-saamna.
* **Logic:** 
  * Price barha di? Flag.
  * 10 mangwaye the, 15 ka bill bheja? Flag.
  * Aisa item daal dia jo order mein tha hi nahi? Ghost item flag.
  * Math ghalat hai? Tax flag.
* **Action & Faisla:** 
  * **Reject:** Bill cancel, vendor ko dispute report chali jaye.
  * **Force Approve:** Farq ke bawajood paisa release karna. Lekin iske sath **waja (reason)** likhna lazmi hai, warna button kaam nahi karega.

---

### Screen 4: Audit Vault (Kacha Chitha)
* **Kyun chahiye:** Tax walo ya police/management ke liye saboot.
* **Logic:** Is screen par koi kuch edit ya delete nahi kar sakta. Ye pathar par lakeer hai.
* **Display Data:**
  * Kis tareekh aur kis second par faisla hua.
  * Kis bill mein kitna fraud ya farq tha.
  * Kis user ne usko approve ya reject kiya.
  * Approve karte waqt usne kia safai/waja pesh ki.
* **Action:** Ek click par poora saboot download karna.

---

### Screen 5: User Roster (Zimmedari Ka Khata)
* **Kyun chahiye:** Control rakhna ke company ka paisa kon bacha raha hai aur kon lutwa raha hai.
* **Data:** 
  * Kon kon active hai.
  * Kisko bill pass karne ki authority hai aur kisko nahi.
  * **Sabse ahem cheez:** Har user ke naam ke aagay likha ho ke usne ab tak kitne galat bills ko "Force Approve" kiya hai.
* **Action:** Naye bande ko add karna ya kisi ka access foran kaat dena.

---

### Screen 6: Detection Rules (Jaal Ki Settings)
* **Kyun chahiye:** Machine ko batana ke kitni ghalti maaf karni hai aur kahan par foran cheekhna hai.
* **Parameters jo set hote hain:**
  * **Wiggle Room:** Agar 5 dollar ya 1% ka chota mota farq ho to ignore karo, us se zyada ho to pakro.
  * **Bank Account Check:** Agar invoice par bank account number purane record se match na kare, to insan se pooche baghair bill ko freeze kardo.
  * **Panic Trigger:** Agar 10,000 dollar se bara jhol pakra jaye, to direct boss ko email chali jaye.
  * **Brain Key:** AI engine ko chalane wali key.