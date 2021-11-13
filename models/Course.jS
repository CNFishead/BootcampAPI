import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please Add a Course title"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    weeks: {
      type: String,
      required: [true, "Please add Number of weeks"],
    },
    tuition: {
      type: Number,
      required: [true, "Please add Cost of course"],
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add Minimum skill"],
      enum: ["beginner", "intermediate", "advanced"],
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
  },
  { timestamps: true }
);

/*
Static method to get avg of course tuitions
what this does essentially is aggregate the tuition, to then update the
bootcamp thats having a course added to it, and return an avg price of that
bootcamp
Essentially we are defining our own model function
*/
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      });
    } else {
      await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
        averageCost: undefined,
      });
    }
  } catch (err) {
    console.error(err);
  }
};
// Call getAverageCost after save
CourseSchema.post("save", async function () {
  // call the function we defined, after its been saved to the database
  // not before, in case there is an error, but after its submitted to the database
  // aggregate the tuition update the average
  this.constructor.getAverageCost(this.bootcamp);
});
// Call getAverageCost before remove
CourseSchema.pre("remove", async function () {
  // same as the post save method, except this time we are removing the
  // aggregate from the avg tuition cost.
  this.constructor.getAverageCost(this.bootcamp);
});

export default mongoose.model("Course", CourseSchema);
