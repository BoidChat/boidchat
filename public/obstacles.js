let waiting_obstacles = new Array();
let live_obstacles = new Array();
let last_ob_time = Date.now();

socket.on('obstacles', (ob_data) => {
    waiting_obstacles = waiting_obstacles.concat(ob_data);
});

function get_active(){
    let now = Date.now();
    let elapsed = now - last_ob_time;
    last_ob_time = now;
    let to_remove = new Array();
    for(let i = 0; i < waiting_obstacles.length; i++){
        waiting_obstacles[i].start_left -= elapsed;
        if (waiting_obstacles[i].start_left <= 0){
            live_obstacles.push(waiting_obstacles[i])
            to_remove.push(i);
        }
    }
    while(to_remove.length > 0){
        waiting_obstacles.splice(to_remove.pop(), 1);
    }
    for(let i = 0; i < live_obstacles.length; i++){
        live_obstacles[i].life_left -= elapsed;
        if (live_obstacles[i].life_left <= 0){
            to_remove.push(i);
        }
        else{
            let progress = 1 - (live_obstacles[i].life_left / live_obstacles[i].life_time);
            live_obstacles[i].current_radius = live_obstacles[i].radius * (1 - 2 * Math.abs((progress - 0.5)));
        }
    }
    while(to_remove.length > 0){
        live_obstacles.splice(to_remove.pop(), 1);
    }
    return live_obstacles;
}