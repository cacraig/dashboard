// This Directive replaces an image with a canvas w/ a letter drawn on it
// if the img src url could not locate an image.
app.directive('fallbackImgSrc', function () {
    return {
      restrict: 'AE',
      link: function (scope, elem, attrs) {
          elem.on('error', function() {
              // Get letter to turn into image.
              var letterToImagize = attrs.name[0];

              // Create canvas 100x100
              var newImgTemplate = document.createElement('canvas');
              newImgTemplate.setAttribute("class", "circular");
              newImgTemplate.style.height = 100;
              newImgTemplate.style.width = 100;
              newImgTemplate.height = 100;
              newImgTemplate.width = 100;
              context = newImgTemplate.getContext('2d');

              var centerX = newImgTemplate.height / 2;
              var centerY = newImgTemplate.width / 2;
              context.font = "normal 75px Arial";
              context.textAlign = 'center';
              context.fillStyle = 'white';
              
              var textWidth = context.measureText(letterToImagize).width;
              var textHeight = context.measureText(letterToImagize).height;

              // Fill text into canvas, and center it.
              context.fillText(letterToImagize, centerX, centerY + (75/2) - 10) ;

              elem.replaceWith(newImgTemplate);
        });
      }
    }
});