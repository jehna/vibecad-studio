// Gridfinity bottle holder with front opening
use <gridfinity-base.scad>

height = 3;           // [1:1:10]
grid_unit = 42;       // [40:0.5:47]
diameter = 35;        // [20:1:60]
wall = 0.8;           // [0.4:0.1:2]
opening_angle = 30;   // [0:5:180]

base_h = gridfinity_base_h();
cylinder_h = height * 7 - base_h;
tolerance = 0.6;
inner_r = (diameter + tolerance) / 2;
outer_r = inner_r + wall;

union() {
    gridfinity_base(grid_unit);

    translate([0, 0, base_h]) {
        difference() {
            cylinder(h=cylinder_h, r=outer_r, $fn=64);
            translate([0, 0, -0.01])
                cylinder(h=cylinder_h + 0.02, r=inner_r, $fn=64);

            // Front opening wedge
            if (opening_angle > 0) {
                rotate([0, 0, -opening_angle / 2])
                    translate([0, 0, -0.01])
                        linear_extrude(cylinder_h + 0.02)
                            polygon([
                                [0, 0],
                                [diameter, 0],
                                [diameter * cos(opening_angle), diameter * sin(opening_angle)]
                            ]);
            }
        }

        // Rounded caps at opening edges
        if (opening_angle > 0) {
            for (a = [-opening_angle / 2, opening_angle / 2]) {
                rotate([0, 0, a])
                    translate([outer_r - wall / 2, 0, 0])
                        cylinder(h=cylinder_h, r=wall / 2, $fn=32);
            }
        }
    }
}
