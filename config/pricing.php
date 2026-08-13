<?php

return [
    /*
     * The smallest number of seats a Team license can be bought with. Shown in
     * the pricing copy and used as the seat stepper's floor. Checkout enforces
     * the authoritative value.
     */
    'team_min_seats' => (int) env('TEAM_MIN_SEATS', 5),
];
