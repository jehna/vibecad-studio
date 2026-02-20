// Gridfinity-compatible baseplate for organizing modular storage bins
grid_x = 2; // [1:1:20]
grid_y = 2; // [1:1:20]
grid_unit = 42; // [40:0.5:44]

/* Gridfinity spec constants */
chamfer_top = 2.15;
wall_section = 1.8;
chamfer_bottom = 0.7;
corner_radius = 4;

/* Derived dimensions */
total_height = chamfer_top + wall_section + chamfer_bottom;

top_opening = grid_unit;
inner_width = top_opening - 2 * chamfer_top;
bottom_width = inner_width - 2 * chamfer_bottom;

plate_x = grid_x * grid_unit;
plate_y = grid_y * grid_unit;

module rounded_square(size, r) {
    offset(r) offset(-r) square([size, size], center=true);
}

module rounded_rect(w, h, r) {
    offset(r) offset(-r) square([w, h], center=true);
}

module pocket() {
    z0 = 0;
    z1 = chamfer_bottom;
    z2 = z1 + wall_section;
    z3 = z2 + chamfer_top;

    // Bottom chamfer
    hull() {
        translate([0, 0, z0])
            linear_extrude(0.01)
                rounded_square(bottom_width, corner_radius);
        translate([0, 0, z1])
            linear_extrude(0.01)
                rounded_square(inner_width, corner_radius);
    }

    // Vertical wall
    translate([0, 0, z1])
        linear_extrude(wall_section)
            rounded_square(inner_width, corner_radius);

    // Top chamfer
    hull() {
        translate([0, 0, z2])
            linear_extrude(0.01)
                rounded_square(inner_width, corner_radius);
        translate([0, 0, z3])
            linear_extrude(0.01)
                rounded_square(top_opening, corner_radius);
    }
}

difference() {
    translate([plate_x / 2, plate_y / 2, 0])
        linear_extrude(total_height)
            rounded_rect(plate_x, plate_y, corner_radius);

    for (ix = [0 : grid_x - 1]) {
        for (iy = [0 : grid_y - 1]) {
            translate([
                ix * grid_unit + grid_unit / 2,
                iy * grid_unit + grid_unit / 2,
                0
            ])
                pocket();
        }
    }
}
