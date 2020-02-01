
let need_update_states = false
let ncov_data = [[14,0,0],
    [1.0,0,0],
    [18.0,0,0],
    [6,0,0],
    [142,1,1],
    [43,1,0],
    [26,0,0],
    [70,0,0],
    [78,0,2],
    [277,0,2],
    [63,0,0],
    [354,0,8],
    [14,0,1],
    [65,1,0],
    [4586.0,162,90],//4586
    [12,0,1],
    [158,0,1],
    [162,0,5],
    [278,2,2],
    [41,0,1],
    [35,0,1],
    [200,0,2],
    [101,0,0],
    [428,0,4],
    [129,0,1],
    [182,0,1],
    [17,0,0],
    [46,1,1],
    [8,0,0],
    [114,1,4],
    [29,0,0],
    [112,1,5],
    [10,0,0],
    [7,0,0]
]

let provinces = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "湖北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
// [14,1,18,6,142,428,129,182,17,46,8,114,29,112,10,7]
let provinces_area = {"新疆": 166.49, "西藏": 122.84, "内蒙古": 118.3, "青海": 72, "四川": 48.5, "黑龙江": 47.3, "甘肃": 45.5, "云南": 39.4, "广西": 23.63, "湖南": 21.18, "陕西": 20.58, "河北": 19, "吉林": 18.74, "湖北": 18.59, "广东": 17.98, "贵州": 17.62, "河南": 16.7, "江西": 16.69, "山东": 15.7, "山西": 15.6, "辽宁": 14.57, "安徽": 13.96, "福建": 12.14, "江苏": 10.26, "浙江": 10.18, "重庆": 8.3, "宁夏": 6.64, "台湾": 3.62, "海南": 3.392, "北京": 1.6807, "天津": 1.13, "上海": 0.634, "香港": 0.1098, "澳门": 0.0254}
let map_margin = {left: 0, right: 0, top: 0, bottom: 0}
let map_width = document.getElementById('map').clientWidth - map_margin.left - map_margin.right,
    map_height = document.getElementById('map').clientHeight - map_margin.top - map_margin.bottom;


let map_svg = d3.select("#map").append("svg")
  .attr("id", "fujian_map")
  .attr("font-family", "Arial")
  .attr("width", map_width - map_margin.left - map_margin.right)
  .attr("height", map_height - map_margin.top - map_margin.bottom);

let states = map_svg.append("g")
  .attr("id", "states")
  .selectAll("path");

let texts = map_svg.append("g")
  .attr("id", "text")

let title = map_svg.append("g")
  .attr("transform", "translate(" + map_width * 0.05  + "," + map_height * 0.09  + ")")
  .append("text")
  .text("新型冠状病毒感染肺炎疫情: 全国态势感知")
  .attr('font-size', "2.5em")
  .attr('text-anchor', "start")
  .style("fill", "#D75E5E")

let day_info = map_svg.append("g")
  .attr("transform", "translate(" + map_width * 0.05  + "," + map_height * 0.96  + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', "6em")
  .attr('text-anchor', "start")
  .style("fill", "#ddd")

let data_info = map_svg.append("g")
  .attr("transform", "translate(" + map_width * 0.95  + "," + map_height * 0.96  + ")")
  .append("text")
  .attr("id", "day")
  .attr('font-size', "1em")
  .attr('text-anchor', "end")
  .text("数据来源：国家卫生健康委员会")
  .style("fill", "#ddd")


let projection = d3.geoAlbers()
  .rotate([-104.5, 0])
  .center([-0, 36])
  .scale(map_height * 1.3)
  .translate([map_width / 2, map_height / 2])

let topology,
  geometries,
  carto_features;

let hexTooltip = d3.select("body").append("div").attr("class", "hexTooltip")

// let pop_data = d3.map();

let carto = d3.cartogram()
    .projection(projection)
    .iterations(20)
    .properties(function (d) {
      // this adds the "properties" properties to the geometries
      return d;
    });


let city_polygon = new Array()
let city_pathNode = new Array()
let hex_state = new Array() // 存储各个六边形的状态, 注意它是反过来的
let city_list = ["福州","厦门","莆田","三明","泉州","漳州","南平","龙岩","宁德"]
let all_major_list = ["数理化生", "经济管理", "语言文学", "信息技术","机械能源", "政法城关","考古历史", "元培计划", ""]
let science_major_list = ["信息技术", "数理化生", "机械能源", "经济管理"]
let literature_major_list = ["语言文学","考古历史", "元培计划", "政法城关"]
let student_data

let color_choices =  ['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6','#ffffcc','#e5d8bd','#fddaec','#f2f2f2']


function read_data(){
  d3.csv("0130.csv")
    .then(function(table_data){
      window._table_data = table_data
      console.log(table_data)
      for (let i = 4; i < 31; i ++){
        setTimeout(function(){
          day = "1月" + i + "日";
          console.log(day);
          let ncov_value = get_value_from_someday(table_data, day);
          console.log(ncov_value);
          update_ncov_data(ncov_value, 500)
          update_day(day)
        },600 * (i - 3))
      }

      // setTimeout(function(){
      //    update_ncov_data()
      // },3000)
    })
}

function update_day(day)
{
  day_info.text(day)
}

function draw_day(){

}

function get_value_from_someday(table_data, day){
  let ncov_value = new Array()
  for (i = 0; i < 34; i ++ )
  {
    // console.log(table_data[i])
    // console.log(table_data[i]["1月5日'"])
    let index = provinces.indexOf(table_data[i]["time"])
    ncov_value[index] = parseInt(table_data[i][day])
  }
  return ncov_value;
}
function update_ncov_data(day_ncov_value, set_time = 3000){
  let value_array = new Array()//[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  for (i = 0; i < 34; i ++){
    value_array[i] = Math.log(day_ncov_value[i] + 1 ) + provinces_area[provinces[i]]/100
    // value_array[i] = day_ncov_value[i] + provinces_area[provinces[i]]/50
  }
  console.log(value_array)


  carto.value(function (d, i ) {
    // let ret = Math.floor(Math.random() * 500)
    let this_value = parseFloat(value_array[i])
    // console.log(this_value)
    return this_value 
    // return 1;
  });

  carto_features = carto(topology, geometries).features;

  states.data(carto_features)
    .text(function (d, i ) {
      return provinces[i];
    })

  // console.log(carto.path)

  // states.transition()
  //     .duration(set_time)
  //     .attr("d", carto.path)
  //     .attr("fill", function(d, i){
  //         // let city_index = parseInt(d.properties.id[3]) - 1
  //         let value = day_ncov_value[i];
  //         return get_color(value)

  //         // return "white"
  //       })


  d3.selectAll(".state")
    .attr("new_d", carto.path)
    // .each(function(d){
    //   console.log(get_centroid(d3.select(this).attr("new_d"))) 
    // })

  let duration_contain = d3.transition()
      .duration(set_time)

  duration_contain.selectAll(".state")
      .attr("d", carto.path)
      .attr("fill", function(d, i){
          // let city_index = parseInt(d.properties.id[3]) - 1
          let value = day_ncov_value[i];
          return get_color(value)
          // return "white"
        })

  // console.log(carto.path)

  let province_name = duration_contain.selectAll(".name")
      .attr("transform", function(d, i){
        
        // console.log(bbox)
        center = get_centroid(d3.select('#province_' + i).attr("new_d"))
        console.log("center", center)
        // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
        center = adjust_position(center, i)
        return "translate(" + center[0] + "," + center[1] + ")"
      })

  province_name.selectAll(".province_number")
      .text(function(d){
        return day_ncov_value[provinces.indexOf(d)]
      })
      .attr("fill-opacity", function(d,i){
        if (day_ncov_value[provinces.indexOf(d)] == 0)
          return 0
        return 1
      })
      .attr("font-size", function(d, i){
        return value_array[provinces.indexOf(d)] * 1.5 + 13
      })
      .attr("y", "1em")

  province_name.selectAll(".province_name")
      .attr("fill-opacity", function(d, i){
        if (day_ncov_value[provinces.indexOf(d)] == 0)
          return 0
        return 1
      })
}

function adjust_position(center, i){
  let position = new Array()
  position[0] = center[0]
  position[1] = center[1]

  if (provinces[i] == "香港" || provinces[i] == "澳门")
    position[1] = center[1] + map_height * 0.05
  if (provinces[i] == "内蒙古")
  {  
    position[0] = center[0] - map_width * 0.03
    position[1] = center[1] + map_height * 0.04
  }
  if (provinces[i] == "天津")
  {  
    position[0] = center[0] + map_width * 0.01
    position[1] = center[1] + map_height * 0.01
  }
  return position
}


d3.json("china.json")
  .then(function(data){
    topology = data;
    geometries = topology.objects.states.geometries;

    console.log(geometries)
    let features = carto.features(topology, geometries),
      path = d3.geoPath()
        .projection(projection);

    console.log(features)




    states = states.data(features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("id", function (d, i) { return "province_" + i; })
        .attr("name", function(d, i){
          return provinces[i]
        })
        .attr("fill", function(d, i){
          // let city_index = parseInt(d.properties.id[3]) - 1
          return "#F2F2F2"

          // return "white"
        })
        // .attr("fill-opacity", 1)
        .attr("d", path)
        .attr("stroke", "#ddd")
        .attr("fill-opacity", 0.8)
    
    texts = texts.selectAll(".name")
      .data(provinces)
      .enter()
      .append("g")
      .attr('class', "name")
      .attr("transform", function(d, i){
        center = get_centroid(d3.select('#province_' + i).attr("d"))
        console.log("center", center)
        // console.log(bbox.x + bbox.width/2, bbox.y + bbox.height/2)
        center = adjust_position(center, i)
        return "translate(" + center[0] + "," + center[1] + ")"
      })
      .attr("id", function(d, i){
        return "province_name_" + i
      })

    texts.append("text")
      .attr("class", "province_name")
      .attr("text-anchor", "middle")
      .text(function(d){
        return d
      })
    
    texts.append("text")
      .attr("class", "province_number")
      .attr("text-anchor", "middle")

      
    


    read_data()
  })
  .catch(function(error){
     // handle error
  })

// map_svg.on("click", function(){
//   let m = d3.mouse(this)
//   console.log(m)
//   // draw_closest(m)
// })
//

function get_centroid(coords){
    coords = coords.replace(/ *[LC] */g,'],[').replace(/ *M */g,'[[[').replace(/ *Z */g,']]]').replace(/ *z */g,']]]').replace(/ /g,'],[');
    if (coords.split("]]][[[").length > 1 ){
      coords = coords.split("]]][[[")[0] + "]]]"
    }
    // console.log(coords)
    return d3.geoPath().centroid({
      "type":"Feature",
      "geometry":{"type":"Polygon","coordinates":JSON.parse(coords)}
  });
}


function get_color(value){
  let color_ncov = ["#FFC1BB", "#F6978E", "#D9736A", "#DF5C50", "#CF4033", '#9F3026', '#881719', '#5F0103']
  if (value == 0)
    return "#F2F2F2"
  if (value < 20)
    return color_ncov[0]
  if (value < 40)
    return color_ncov[1]
  if (value < 80)
    return color_ncov[2]
  if (value < 160)
    return color_ncov[3]
  if (value < 320)
    return color_ncov[4]
  if (value < 640)
    return color_ncov[5]
  // if (value < 640)
  //   return color_ncov[6]
  return color_ncov[6]

}


function sleep(delay) {
        let start = new Date().getTime();
        while (new Date().getTime() < start + delay);
      }

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};
