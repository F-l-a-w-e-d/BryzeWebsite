 let propertyData = {};

        async function loadProperties() {
            try {
                const response = await fetch('./listings.json');
                if (!response.ok) throw new Error('Failed to fetch JSON');
                const data = await response.json();

                propertyData = data;
            } catch (err) {
                console.error(err);
            }
        }

        $(document).ready(function() {
            loadProperties();    

            // Render the chosen category into the grid
            function renderCategory(category) {
                const container = $('#property-container');

                // exit animation (fade/slide)
                container.removeClass('opacity-100 translate-y-0').addClass('opacity-0 translate-y-4');

                setTimeout(() => {
                    container.empty();
                    const data = propertyData[category] || [];

                    data.forEach((item, index) => {
                        const cardHtml = `
                            <div class="property-card bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col" style="border-color: var(--beige-dark);" data-category="${category}" data-index="${index}">
                                <div class="card-image">
                                    <img src="${item.img}" alt="${item.title}" class="w-full h-full">
                                </div>

                                <div class="card-content flex-1 p-5 flex flex-col">
                                    <h3 class="font-bold text-lg mb-2" style="color: var(--text-dark); font-family: 'Open Sans', sans-serif;">${item.title}</h3>
                                    <p class="text-sm mb-4 leading-relaxed line-clamp-3" style="color: var(--text-dark); opacity: 0.85;">${item.desc}</p>

                                    <div class="mt-auto border-t pt-4" style="border-color: var(--beige);">
                                        <p class="font-extrabold text-xl tracking-tight mb-4" style="color: var(--text-dark);">${item.price}</p>
                                        <button type="button" class="see-details-btn w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition" style="background: var(--beige); color: var(--text-dark); border: 1px solid var(--beige-dark);">See Details</button>
                                    </div>

                                    <!-- Expanded details inline -->
                                    <div class="expanded-details rounded-lg" aria-hidden="true">
                                        <button type="button" class="expanded-close" aria-label="Close details">X</button>

                                        <div class="mb-3">
                                            <p class="text-sm muted"><span class="font-semibold">Location:</span> ${item.location}</p>
                                            <p class="text-sm muted"><span class="font-semibold">Accessible to:</span> ${item.accessibleTo}</p>
                                        </div>

                                        <div class="grid grid-cols-2 gap-3 text-sm mt-2">
                                            <div><span class="font-semibold">Area:</span> ${item.area}</div>
                                            <div><span class="font-semibold">Floor Area:</span> ${item.floorArea}</div>
                                            <div><span class="font-semibold">Reservation Fee:</span> ${item.reservationFee ? '₱ ' + item.reservationFee : item.reservationFee}</div>
                                            <div><span class="font-semibold">Down Payment:</span> ${item.downpayment ? '₱ ' + item.downpayment : item.downpayment}</div>
                                            <div class="col-span-2"><span class="font-semibold">TCP:</span> ${item.tcp ? '₱ ' + item.tcp : item.tcp}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        container.append(cardHtml);
                    });

                    // entry animation
                    container.removeClass('opacity-0 translate-y-4').addClass('opacity-100 translate-y-0');
                }, 250);
            }

            // Open card: add col-span-full + expanded class, then open details by toggling .is-open (CSS anim)
            function openCard(card) {
                // close others (if open)
                $('.property-card').not(card).each(function() {
                    const other = $(this);
                    const otherDetails = other.find('.expanded-details');
                    if (otherDetails.hasClass('is-open')) {
                        otherDetails.removeClass('is-open');
                        // remove expanded classes after animation completes
                        setTimeout(() => {
                            other.removeClass('col-span-full expanded');
                            other.find('.see-details-btn').show();
                        }, 380);
                    }
                });

                // if this card is not open, open it
                const details = card.find('.expanded-details');
                if (!details.hasClass('is-open')) {
                    // make grid item span all columns so it occupies full width
                    card.addClass('col-span-full expanded');
                    // small delay so layout recalculates before we open the details for smoothness
                    setTimeout(() => {
                        details.addClass('is-open');
                        card.find('.see-details-btn').hide();
                        // scroll into view for better UX
                        $('html, body').animate({ scrollTop: card.offset().top - 32 }, 300);
                    }, 28);
                }
            }

            // Close card
            function closeCard(card) {
                const details = card.find('.expanded-details');
                if (details.hasClass('is-open')) {
                    details.removeClass('is-open');
                    // after transition finish remove full-width classes
                    setTimeout(() => {
                        card.removeClass('col-span-full expanded');
                        card.find('.see-details-btn').show();
                    }, 380);
                } else {
                    // just ensure classes removed
                    card.removeClass('col-span-full expanded');
                    card.find('.see-details-btn').show();
                }
            }

            // Delegated events (cards are dynamic)
            $(document).on('click', '.see-details-btn', function() {
                const card = $(this).closest('.property-card');
                openCard(card);
            });

            $(document).on('click', '.expanded-close', function(e) {
                e.stopPropagation();
                const card = $(this).closest('.property-card');
                closeCard(card);
            });

            // tabs
            $('.tab-btn').on('click', function() {
                const category = $(this).data('category');
                // close all expansions
                $('.expanded-details').removeClass('is-open');
                setTimeout(() => {
                    $('.property-card').removeClass('col-span-full expanded');
                    $('.see-details-btn').show();
                }, 360);

                // update tab styles
                $('.tab-btn').removeClass('tab-active').addClass('tab-inactive');
                $(this).removeClass('tab-inactive').addClass('tab-active');

                renderCategory(category);
            });

            // initial
            renderCategory('house-lot');
        });