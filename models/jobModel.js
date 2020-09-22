const moongoose = require("mongoose");

const jobSchema = new moongoose.Schema({
  company: {
    type: String,
    required: [true, "Emri i kompanise eshte i kerkuar"],
  },
  email: {
    type: String,
    required: [true, "Email eshte i kerkuar"],
  },
  phone: {
    type: String,
    required: [true, "Telefoni eshte i kerkuar"],
  },
  adress: {
    type: String,
    required: [true, "Adresa eshte i kerkuar"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  jobTitle: {
    type: String,
    required: [true, "Titulli i punes eshte i kerkuar"],
  },
  salary: {
    type: Number,
    required: [true, "Pagesa eshte e kerkuar"],
  },
  jobDescription: {
    type: String,
    required: [true, "Pershkrimi i punes eshte i kerkuar"],
  },

  technologies: {
    type: [String],
    required: [true, "Jepni te pakten nje teknologji"],
    validate: {
      validator: function (el) {
        if (el.length < 1) return false;
      },
      message: "Jepni te pakten nje teknologji",
    },
    enum: {
      values: ["node.js", "html", "js", "css"],
      message: "Zgjidhni nje prej teknologjive me siper!",
    },
  },
});

const Job = moongoose.model("Job", jobSchema);

module.exports = Job;
