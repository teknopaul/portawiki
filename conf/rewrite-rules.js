/**
 * Security rewrites
 */
module.exports = [
                  {regex : /[<>'"]/g, 	replace : '', 	flags : 'N'} ,
                  {regex : /\0/g, 		replace : '', 	flags : 'N'}
                 ];
