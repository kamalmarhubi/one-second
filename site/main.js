import $ from 'jquery'
import curriculum from 'curriculum'
import React from 'react'

class QuizQuestion extends React.Component {
    render() {
        let { code, name, selectedAnswer, answer, exactAnswer } = this.props;
        //  buttons + answer
        //  
        return <div className='col-md-5'>
            <h3>{name}</h3>
            <AnswerSelector name={name} value={selectedAnswer} />
            <pre>{code}</pre>
            { selectedAnswer !== undefined ?
                <div className='answer'>
                    <b> Answer: </b>{english(answer)}  (exact amount: {english(exactAnswer)})
                </div>
            : undefined }
        </div>;
    }
}

class AnswerSelector extends React.Component {
    render() {
        let { name, onChange, value } = this.props;
        const options = [1, 10, 100, 1000, 10000];
        return <ul>{ options.map(val => <AnswerChoice
                key={val}
                checked={val === value}
                name={name}
                value={val}
                onChange={() => onChange(val)} />)
        }</ul>;
    }
}

class AnswerChoice extends React.Component {
    render() {
        let { value, name, onChange, checked } = this.props;
        let id = `${name}-${value}`;
        return <li>
            <label htmlFor={id}>{value}</label>
            <input type='radio' name={name} id={id} value={value}
                onChange={onChange} checked={checked} />
        </li>;
    }
}

class Section extends React.Component {
    render() {
        let { text, programs } = this.props;
        return <div className='row'>
            <div className='col-md-6 col-md-offset-2 jumbotron'>{text}</div>
            {programs.map(prog => <QuizQuestion key={prog.name} {...prog} />)}
        </div>;
    }
}

class Quiz extends React.Component {
    render() {
        let { curriculum, benchmarks } = this.props;
        return <div>
            { curriculum.map(({text, programs}, index) =>
                <Section key={index} text={text} programs={
                  programs.map(prog => Object.assign({name: prog}, benchmarks[prog]))} />) }
        </div>;
    }
}

const initialState = {
}

function question(state, action) {
    switch (action.type) {
        case SET_ANSWER:
        default:
          return state;
    }
}

function quiz(state = initialState, action) {
  // For now, don’t handle any actions
  // and just return the state given to us.
  return state;
}


var english = function(iters) {
    var bil = Math.pow(10, 9)
    var mil = Math.pow(10, 6)
    var thousand = 1000
    if (iters >= bil) {
        return Math.round(iters / bil) + ",000,000,000"
    } else if (iters >= mil) {
        return Math.round(iters / mil) + ",000,000"
    } else if (iters >= thousand) {
        return Math.round(iters / thousand) + ",000"
    } else {
        return iters
    }
}

var disp = function(benchmarks, name) {
    var benchmark_results = benchmarks[name]
    var code = benchmark_results["code"]
    var iters = benchmark_results["rounded_iters"]
    var exact_iters = benchmark_results["exact_iters"]
    iters = english(iters)

    var answer = "<div style='display:none' class='answer'> <b> Answer: </b> " + english(iters) +  " (exact amount: " + english(exact_iters) + ") </div>"
    var buttons1 = '<div class="btn-toolbar" role="toolbar"> <div class="btn-group" role="group"> <button type="button" class="btn btn-default">1</button> <button type="button" class="btn btn-default">10</button> <button type="button" class="btn btn-default">100</button> <button type="button" class="btn btn-default">1,000</button> <button type="button" class="btn btn-default">10,000</button> <button type="button" class="btn btn-default">100,000</button><button type="button" class="btn btn-default">1,000,000</button> </div>'
    var buttons2 = '<div class="btn-group" role="group"> <button type="button" class="btn btn-default">10,000,000</button> <button type="button" class="btn btn-default">100,000,000</button> <button type="button" class="btn btn-default">1,000,000,000</button></div></div>'
    var buttons = buttons1 + buttons2
    var code = "<pre>" + code + "</pre>" + "</div>"
    return "<div class = 'col-md-5'>" + "<h3>" + name + "</h3>" + buttons + answer + code
}

var display = function(benchmarks) {
    var i;
    for (i = 0; i < curriculum.length; i++) {
        var programs = curriculum[i]['programs']
        var j;
        $("#code").append("<div class='row'>")

        $("#code").append("<div class='col-md-6 col-md-offset-2 jumbotron'>" + curriculum[i]['text'] + "</div>")
        for (j = 0; j < programs.length; j++) {
            name = programs[j]
            $("#code").append(disp(benchmarks, name))
        }
        $("#code").append("</div>")
    }
}
$.getJSON("/benchmarks.json", function(result) {
    var json = result
    display(result)
    $('button').on('click', function() {
        $(this).parent().parent().find('button').removeClass('active');
        $(this).addClass('active');
        $(this).parent().parent().parent().find('.answer').show();
    })
    React.render(<Quiz curriculum={curriculum} benchmarks={result}/>, document.getElementById('quiz'));
});

