import LetterProps from '../utils/text/LetterProps';
import TextProperty from '../utils/text/TextProperty';
import TextAnimatorProperty from '../utils/text/TextAnimatorProperty';
import buildShapeString from '../utils/shapes/shapePathBuilder';

function ITextElement() {
}

ITextElement.prototype.takeCareOfHebrew = function (data) {
    /// check if this path in the data object exists : data.t.d.k[0].s.t

    if (!data || !data.t || !data.t.d || !data.t.d.k || !data.t.d.k.length > 0 || !data.t.d.k[0] || !data.t.d.k[0].s || !data.t.d.k[0].s.t) return;

    let layerText = data.t.d.k[0].s.t;
    if (!layerText) return;

    // console.log('Heb', data);

    // If we find hebrew or arabic characteres, we should add a class to the layer
    if (/[\u0590-\u05FF\u0600-\u06FF]/.test(layerText)) {
        console.log('Found Hebrew text in ' + layerText);

        const currentClass = data.cl;

        // If it has no 'hebrew-rtl' class, we will add it and process the text
        if (!currentClass || !currentClass.includes('hebrew-rtl')) {


            data.cl = (currentClass ? currentClass + ' ' : '') + 'hebrew-rtl';

            // Function to reverse the letters in each English word
            function reverseWord(word) {
                console.log('Reversing word:', word);
                const reveresed = word.split('').reverse().join('');
                return reveresed;
            }

            // Function to reverse the order of English words while preserving Hebrew structure
            function processText(inputText) {
                console.log('Processing text:', inputText);

                // Detect and log all English words
                let englishWords = inputText.match(/[a-zA-Z]+/g);
                console.log('Detected English words:', englishWords);

                if (!englishWords) return inputText;

                return inputText.replace(/([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/g, match => {
                    console.log('Processing match:', match);
                    // Reverse the entire sequence of English words
                    return match.split(/\s+/).reverse().map(reverseWord).join(' ');
                });
            }

            // Flip English words and their order (only happens once)
            var processedText = processText(layerText);
            console.log(processedText);

            // Convert the processed text back to an array of characters
            // Flip justification 0 <--> 1, if it's 2, keep it the same
            if (data.t.d.k[0].s.j === 1) {
                data.t.d.k[0].s.j = 0;
            } else if (data.t.d.k[0].s.j === 0) {
                data.t.d.k[0].s.j = 1;
            }
            data.t.d.k[0].s.t = processedText
        }
    }


}

ITextElement.prototype.initElement = function (data, globalData, comp) {
    this.lettersChangedFlag = true;
    this.initFrame();
    this.takeCareOfHebrew(data);
    this.initBaseData(data, globalData, comp);
    this.textProperty = new TextProperty(this, data.t, this.dynamicProperties);
    this.textAnimator = new TextAnimatorProperty(data.t, this.renderType, this);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.createRenderableComponents();
    this.createContent();
    this.hide();
    this.textAnimator.searchProperties(this.dynamicProperties);
};

ITextElement.prototype.prepareFrame = function (num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
};

ITextElement.prototype.createPathShape = function (matrixHelper, shapes) {
    var j;
    var jLen = shapes.length;
    var pathNodes;
    var shapeStr = '';
    for (j = 0; j < jLen; j += 1) {
        if (shapes[j].ty === 'sh') {
            pathNodes = shapes[j].ks.k;
            shapeStr += buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
        }
    }
    return shapeStr;
};

ITextElement.prototype.updateDocumentData = function (newData, index) {
    this.textProperty.updateDocumentData(newData, index);
};

ITextElement.prototype.canResizeFont = function (_canResize) {
    this.textProperty.canResizeFont(_canResize);
};

ITextElement.prototype.setMinimumFontSize = function (_fontSize) {
    this.textProperty.setMinimumFontSize(_fontSize);
};

ITextElement.prototype.applyTextPropertiesToMatrix = function (documentData, matrixHelper, lineNumber, xPos, yPos) {
    if (documentData.ps) {
        matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
    }
    matrixHelper.translate(0, -documentData.ls, 0);
    switch (documentData.j) {
        case 1:
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]), 0, 0);
            break;
        case 2:
            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2, 0, 0);
            break;
        default:
            break;
    }
    matrixHelper.translate(xPos, yPos, 0);
};

ITextElement.prototype.buildColor = function (colorData) {
    return 'rgb(' + Math.round(colorData[0] * 255) + ',' + Math.round(colorData[1] * 255) + ',' + Math.round(colorData[2] * 255) + ')';
};

ITextElement.prototype.emptyProp = new LetterProps();

ITextElement.prototype.destroy = function () {

};

ITextElement.prototype.validateText = function () {
    if (this.textProperty._mdf || this.textProperty._isFirstFrame) {
        this.buildNewText();
        this.textProperty._isFirstFrame = false;
        this.textProperty._mdf = false;
    }
};

export default ITextElement;
