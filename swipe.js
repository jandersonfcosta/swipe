/*
    Swipe 1.0.0
    Janderson Costa
    Copyright 2016, MIT License

    Uso:
        // js
        var swipe = new Swipe({
            component: document.querySelector(".swipe"),
            speed: "300ms", // opcional
            onTouchStart: function(slideIndex) {
                //..
            },
            onTouchMove: function(x) {
                //..
            },
            onTouchEnd: function(slideIndex) {
                //..
            }
        });

        // html
        <div class="swipe">
            <div class="slider">
                <div class="slide">
                    ...
                </div>
                ...
            </div>
        </div>

        // css
        .swipe {
            overflow: hidden;
        }

        .swipe .slider {
            display: flex;
            position: relative;
        }

        .swipe .slider .slide {
            min-width: 100%;
        }
*/

function Swipe(options) {
	options = options ? options : {};

	var tabbar = options.tabbar,
    	speed = options.speed || "300ms",
		swipe = options.component || document.querySelector(".swipe"),
		slider = swipe.querySelector(".slider"),
		slides = swipe.querySelectorAll(".slide"),
		slideWidth = document.body.clientWidth,
		slidesWidth = slideWidth * slides.length,
		x = 0,
        startX = 0,
		moveX = 0,
        endX = 0,
        translateX = 0,
		slideIndex = 0,
		timeStart,
		timeEnd;

	// touchstart
	slider.removeEventListener("touchstart", touchStart);
    slider.addEventListener("touchstart", touchStart, false);
	function touchStart(event) {
		slider.style.webkitTransitionDuration = null; // null remove o atributo do elemento

		if (tabbar)
			tabbar.style.webkitTransitionDuration = null;

		startX = event.targetTouches[0].clientX;
		timeStart = new Date();
        translateX = getTranslateX();

		if (options.onTouchStart)
			options.onTouchStart(slideIndex);
    }

    // touchmove
    slider.removeEventListener("touchmove", touchMove);
    slider.addEventListener("touchmove", touchMove, false);
	function touchMove(event) {
		moveX = event.targetTouches[0].clientX;
        x = moveX - startX + translateX;

		if (x <= 0 && x >= -(slideWidth * (slides.length - 1))) {
            slider.style.webkitTransform = "translateX(" + x + "px)";
        }
	}

    // touchend
	slider.removeEventListener("touchend", touchEnd);
    slider.addEventListener("touchend", touchEnd, false);
	function touchEnd(event) {
		endX = event.changedTouches[0].clientX;
		timeEnd = new Date();
		slideIndex = getSlideIndexByTranslateX();

		var xDiff = endX - startX,
			timeDiff = timeEnd - timeStart,
			isLastSlide = slideIndex === slides.length - 1;

		// toque rápido para direita ou esquerda
		if (timeDiff < 200 && xDiff !== 0) { // 150ms
			if (xDiff < 0) {
				if (!isLastSlide)
					slideIndex++; // ->
			} else if (slideIndex > 0) {
				slideIndex--; // <-
			}
		}

		slider.style.webkitTransitionDuration = speed;
		slider.style.webkitTransform = "translateX(-" + (slideIndex * slideWidth) + "px)";

		if (options.onTouchEnd)
			options.onTouchEnd(slideIndex);
	}

    function getTranslateX() {
        var tx = slider.style.webkitTransform;
        return tx ? -Number(tx.match(/[0-9]+/)[0]) : 0;
    }

	function getSlideIndexByTranslateX() {
		return Math.abs(Math.round((getTranslateX() * slides.length) / slidesWidth));
	}

	this.slide = slide;
	function slide(index) {
		slider.style.webkitTransform = "translateX(-" + (index * slideWidth) + "px)";
	}

	this.onWindowResize = onWindowResize;
	function onWindowResize(callback) {
		// ações que devem ser executadas se a janela foir redimensionada

		slideWidth = document.body.clientWidth;
		slidesWidth = slideWidth * slides.length;

		if (callback)
            callback();
	}

	if (options.onTouchMove) {
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutationRecord) {
				var transform = mutationRecord.target.style.transform;

				if (transform) {
					var translateX = Number(transform.match(/[0-9]+/g)[0]);
					options.onTouchMove(translateX);
				}
			});
		});

		observer.observe(slider, {
			attributes: true,
			attributeFilter: ["style"]
		});
	}
}
