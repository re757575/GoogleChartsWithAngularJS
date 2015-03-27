exports.partials = function(req, res){
  var filename = req.params.filename;
  if(!filename) return;  // might want to change this
  res.render("app/partials/" + filename );
};