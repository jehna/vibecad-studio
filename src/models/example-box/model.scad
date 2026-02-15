// A simple parametric box with rounded edges and a hollow interior
length = 40; // [10:100]
width = 30;  // [5:80]
height = 20; // [5:60]
wall = 2;    // [1:5]
radius = 3;  // [1:10]

difference() {
    minkowski() {
        cube([length - 2*radius, width - 2*radius, height/2]);
        cylinder(r=radius, h=height/2, $fn=32);
    }
    translate([-wall / 2, -wall / 2, wall])
        cube([length - wall*2, width - 2*wall, height]);
}
