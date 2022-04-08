const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Category = require('../models/category');

exports.getCaterers = async (req,res,next) => {

    try{
        const totalCaterers = await Store.count()
        const caterers = await Store.findAll()
        // const details = await Store.findAll( {where: { userId: caterers._id }})
                res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                   caterer: caterers,
                                   totalCaterers: totalCaterers})
        } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        }

}

exports.getCaterer = async (req,res,next)=>{
    const catId = req.params.catId;
  try { 
  const caterer = await Store.findOne({where:{ id: catId }})
  
      if (!caterer) {
        const error = new Error("Couldn't Find the Caterer");
        error.statusCode = 404;
        throw error;
      }
//   const items = await 
      res.status(200).json({ message: 'Caterer fetched', data: caterer })
} catch(err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
}