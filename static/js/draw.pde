
int currentID= -1;
String currentType = "";
myShape[] shapes = new myShape[0];
int shapeId = 0;


$('.addRect').click(function(){
	currentType = "rect";

});


void setup() {
	
	var width = parseInt($("#dropzone").css("width"));
	var height = parseInt($("#dropzone").css("height"));

	size(width, height);
	background(255);
	smooth();
	loop();  

	shapes[shapeId] = new myShape(currentType, shapeId, 100,100, 100, 100);
	shapes[shapeId].display();
}

void draw() {
/*
	line(mouseX, mouseY, 100, 90);

	for(int i = 0; i< shapes.length; i++){
		shapes[i].display();
		console.log("hello web!");
	}
*/
}

void mousePressed() {

	shapes[shapeId] = new myShape(currentType, shapeId, mouseX, mouseY, 0, 0);
	shapes[shapeId].display();

}

void mouseDragged() {
	
	shapes[shapeId].width = mouseX - shapes[shapeId].x;
	shapes[shapeId].height = mouseY - shapes[shapeId].y;
	shapes[shapeId].display();
	console.log(shapes[shapeId].width);
}

void mouseReleased() {
	
	shapes[shapeId].width = mouseX - shapes[shapeId].x;
	shapes[shapeId].height = mouseY - shapes[shapeId].y;
	shapes[shapeId].display();

	shapeId ++;


}

class myShape {
	
	String type = "rect";

	int x = 0, y = 0, width = 0, height = 0, id = 0;
	boolean isIn = false;

	myShape( String t, int ID, int x1, int y1, int w, int h ) {

		type = t;
		id = ID;

		x = x1;
		y = y1;
		width = w;
		height = h;

		

	}

	void encima() {

		if ( dist(x, y, mouseX, mouseY) < r ) 
			isIn = true;
		else 
			isIn = false;

	}

	void move() {

		if ( isIn && mousePressed && ( currentID == -1 || currentID == id ) ) {
			x = mouseX;
			y = mouseY;
			currentID = id;
		}


	}

	void display() {

		noFill();
		stroke(200,200,200,70);
		strokeWeight(6);  
		rect(x, y, width, height);


	}
}	