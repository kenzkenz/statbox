<template>
  <div id="app">
    <div id="chart-parent-div">
      <div id="left-side-div" class="side-div side-div-left">
        <v-menu-side side="leftSide"/>
      </div>
      <div id="chart-div">
        <div id="top-menu-div">
          <div style="padding: 10px">
            <el-radio-group v-model="s_chartType" size="small" type="primary" plain >
              <el-radio-button label="bar" >棒＋折れ線</el-radio-button>
              <el-radio-button label="scatter">散布図</el-radio-button>
              <el-radio-button label="bubble">バブル</el-radio-button>
              <el-radio-button label="tree">ツリー</el-radio-button>
              <!--<el-radio-button label="boxplot">箱ひげ図作成中</el-radio-button>-->
            </el-radio-group>
            <el-button type="primary" plain size="small" style="margin-left: 10px;" @click="reset">リセット</el-button>
            <el-button type="primary" plain size="small" style="margin-left: 10px;" @click="download">DL</el-button>
          </div>
        </div>
        <div id="chart01">
          <v-d3/>
        </div>
      </div>
      <div id="right-side-div" class="side-div side-div-right">
        <v-menu-side side="rightSide"/>
      </div>
      <div id="map-div">
        <!--<div class="drag-handle" v-my-drag-handle>ddddd</div>-->
        <div id="left-map-div"/>
        <div id="right-map-div"/>
      </div>
    </div>
    <div class="tooltip"></div>

    <el-dialog title = "" :visible.sync = "s_elDialogVisible" width = "30%">
      <span>{{ s_elDialogMsg }}</span>
      <span slot="footer" class="dialog-footer">
      <!--<el-button @click="dialogVisible = false">Cancel</el-button>-->
      <!--<el-button type="primary" @click="dialogVisible = false">Confirm</el-button>-->
        <el-button type="primary" @click="setElDialogVisible">OK</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import menuSide from './components/menu-side'
import D3 from './components/D3'
import EncodingJapanese from 'encoding-japanese'
import Papa from 'papaparse';
export default {
  name: 'app',
  components: {
    'v-menu-side': menuSide,
    'v-d3': D3,
  },
  data() {
    return {
      // elDialogVisible: true
    };
  },
  computed: {
    s_elDialogMsg () { return this.$store.state.base.elDialogMsg },
    s_elDialogVisible: {
      get () { return this.$store.state.base.elDialogVisible  },
      set () { this.$store.commit('base/setElDialogVisible') }
    },
    s_bottomFlg () { return this.$store.state.base.bottomFlg },
    s_chartType: {
      get () { return this.$store.state.base.chartType },
      set (value) { this.$store.commit('base/updateChartType', value) }
    },
    s_leftCsvDataset () { return this.$store.state.base.leftCsvDataset },
    s_rightCsvDataset () { return this.$store.state.base.rightCsvDataset }
  },
  methods: {
    setElDialogVisible () { this.$store.commit('base/setElDialogVisible') },
    reset () { location.reload() },
    btnBar () { this.$store.commit('base/updateChartType', 'bar') },
    btnScatter () { this.$store.commit('base/updateChartType', 'scatter') },
    btnBubble () { this.$store.commit('base/updateChartType', 'bubble') },
    download () {
      // configの初期値
      const config = {
        delimiter: ',', // 区切り文字
        header: true, // キーをヘッダーとして扱う
        newline: '\r\n', // 改行
      };
      if (!this.s_leftCsvDataset) {
        alert('左からデータを選んでください。')
        return
      }
      const leftData =this.s_leftCsvDataset.data;
      if (this.s_rightCsvDataset) {
        const rightData = this.s_rightCsvDataset.data;
        for (let i in leftData) {
          const result = rightData.find((el) => el.コード === leftData[i].コード);
          if(result) {
            for(let key in result) {
              if (key !== 'コード' && key !== '市町村名') leftData[i][key] = result[key]
            }
          }
        }
      }
      // 区切り文字へ変換
      const delimiterString = Papa.unparse(this.s_leftCsvDataset.data, config);
      // blobUrlへの変換
      const strArray = EncodingJapanese.stringToCode(delimiterString);
      const convertedArray = EncodingJapanese.convert(strArray,'SJIS', 'UNICODE');
      const UintArray = new Uint8Array(convertedArray);
      const blobUrl = new Blob([UintArray], {type: 'text/csv'});
      const blob = blobUrl;
      const aTag = document.createElement('a');
      let fileName
      if (this.s_rightCsvDataset) {
        fileName = this.s_leftCsvDataset.name + '+' + this.s_rightCsvDataset.name + '.csv'
      } else {
        fileName = this.s_leftCsvDataset.name + '.csv'
      }
      aTag.download = fileName;
      // 各ブラウザに合わせ、CSVをダウンロード
      if (window.navigator.msSaveBlob) {
        // for IE
        window.navigator.msSaveBlob(blob, aTag.download);
      } else if (window.URL && window.URL.createObjectURL) {
        // for Firefox
        aTag.href = window.URL.createObjectURL(blob);
        document.body.appendChild(aTag);
        aTag.click();
        document.body.removeChild(aTag);
      } else if (window.webkitURL && window.webkitURL.createObject) {
        // for Chrome
        aTag.href = (window.URL || window.webkitURL).createObjectURL(blob);
        aTag.click();
      } else {
        // for Safari
        window.open(
                `data:type/csv;base64,${window.Base64.encode(this.state.content)}`,
                '_blank'
        );
      }
    }
  }
}
</script>

<style>
  html {
    background: grey;
  }
  #app {
    margin: 0;
    padding:0;
  }
  #chart-parent-div {
    width:1410px;
    margin: auto;
    position: relative;
  }
  #chart-div {
    position: absolute;
    top:0;
    left:305px;
    /*background: red;*/
    width: 800px;
    height: 450px;
  }
  #top-menu-div {
    height: 50px;
    width: 100%;
    background: azure;
    border-bottom: solid 1px grey;
    /*padding: 10px 0 0 10px;*/
  }
  #chart01 {
    /*border: solid 1px grey;*/
    width: 100%;
    height: 400px;
    background: white;
    position: relative;
  }
  .side-div {
    padding-top: 10px;
    width:300px;
    height: 843px;
    /*display: inline-block;*/
    /*vertical-align:top;*/
    border: solid 1px gainsboro;
    background: lavenderblush;
    overflow: auto;
  }
  .side-div-left {
    border-bottom-left-radius: 8px;
    border-top-left-radius: 8px;
  }
  .side-div-right {
    border-bottom-right-radius: 8px;
    border-top-right-radius: 8px;
    position: absolute;
    top: 0;
    left: 1108px;
  }
  .el-tree {
    background: rgba(0,0,0,0)!important;
  }
  #chart-bottom-left-div {
    margin-left: 10px;
    position: absolute;
    bottom: 10px;
  }
  #chart-bottom-right-div {
    margin-right: 10px;
    position: absolute;
    bottom: 10px;
    right: 0;
  }
  #map-div {
    /*border: solid 1px gainsboro;*/
    margin-top:5px;
    background: gray;
    width:800px;
    height: 400px;
    /*border-radius: 8px;*/
    position: absolute;
    left: 305px;
    top: 450px;
  }
  #left-map-div {
    height: 100%;
    width: 398px;
    background: silver;
  }
  #right-map-div {
    height: 100%;
    width: 398px;
    background: silver;
    position: absolute;
    top:0;
    right:0
  }
  .tooltip {
    position: absolute;
    text-align: center;
    width: auto;
    height: auto;
    padding: 5px;
    font-size: 12px;
    background: white;
    border-radius: 4px;
    -webkit-box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);
    -moz-box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);
    visibility: hidden;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity 2s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
