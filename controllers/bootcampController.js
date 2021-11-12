import Bootcamp from "../models/Bootcamp.js";

/*
  @Desc:   Return All bootcamps
  @Route:  GET /api/v1/bootcamps
  @Access: Public
*/
const getBootcamps = async (req, res) => {
  try {
    const data = await Bootcamp.find();
    res.status(200).json({ success: true, count: data.length, data: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.error });
  }
};
/*
  @Desc:   Return single bootcamp
  @Route:  GET /api/v1/bootcamps/:id
  @Access: Public
*/
const getBootcamp = async (req, res) => {
  try {
    const data = await Bootcamp.findById(req.params.id);
    if (!data) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};
/*
  @Desc:   update bootcamp
  @Route:  PUT /api/v1/bootcamps
  @Access: Private
*/
const updateBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
/*
  @Desc:   DELETE bootcamp
  @Route:  DELETE /api/v1/bootcamps
  @Access: Private
*/
const deleteBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
/*
  @Desc:   Create new bootcamp
  @Route:  POST /api/v1/bootcamps
  @Access: Private
*/
const createBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e.error });
  }
};

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
};
