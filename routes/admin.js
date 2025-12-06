const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/role");

router.get("/dashboard", isAdmin, adminCtrl.listSubmissions);
router.get("/submissions/:id", isAdmin, adminCtrl.viewSubmission);
router.post("/submissions/:id/grade", isAdmin, adminCtrl.postGrade);
router.post("/submissions/:id/delete", isAdmin, adminCtrl.deleteSubmission);

module.exports = router;
