// Gridfinity bin base — the part that slots into a baseplate pocket.
// Usage: use <gridfinity-base.scad>
//        gridfinity_base(grid_unit=42);

module gridfinity_base(grid_unit = 42) {
    tolerance = 0.5;
    chamfer_bot = 0.8;
    wall_h = 1.8;
    chamfer_top = 2.15;

    top_w = grid_unit - tolerance;           // 41.5
    mid_w = top_w - 2 * chamfer_top;         // 37.2
    bot_w = mid_w - 2 * chamfer_bot;         // 35.6

    r_bot = 1.6 / 2;   // 0.8
    r_mid = 3.2 / 2;   // 1.6
    r_top = 7.5 / 2;   // 3.75

    z0 = 0;
    z1 = chamfer_bot;                        // 0.8
    z2 = z1 + wall_h;                        // 2.6
    z3 = z2 + chamfer_top;                   // 4.75

    translate([0, 0, 0]) {
        // Bottom chamfer
        hull() {
            translate([0, 0, z0])
                linear_extrude(0.01)
                    _gf_rounded_sq(bot_w, r_bot);
            translate([0, 0, z1])
                linear_extrude(0.01)
                    _gf_rounded_sq(mid_w, r_mid);
        }

        // Vertical wall
        translate([0, 0, z1])
            linear_extrude(wall_h)
                _gf_rounded_sq(mid_w, r_mid);

        // Top chamfer
        hull() {
            translate([0, 0, z2])
                linear_extrude(0.01)
                    _gf_rounded_sq(mid_w, r_mid);
            translate([0, 0, z3])
                linear_extrude(0.01)
                    _gf_rounded_sq(top_w, r_top);
        }
    }
}

module _gf_rounded_sq(size, r) {
    offset(r) offset(-r) square([size, size], center=true);
}

// Height of the base profile (useful for positioning things on top)
function gridfinity_base_h() = 0.8 + 1.8 + 2.15; // 4.75
