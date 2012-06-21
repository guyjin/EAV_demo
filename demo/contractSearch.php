<?php

require_once '../../../../webConfig.php';

require_once BASEPATH . COREPHP . 'NationalPage.class.php';

$w = new NationalPage(
        $id = 'Home',
        $title = 'EAV Contract Search',
        $template = 'Empty',
        $class = '',
        $js = "",
        $css = "",
        $pageTitle = '',
        $pageSubTitle = '',
        $header = 'wo',
        $nav = 'navDefault',
        $footer = 'wo',
        $content = '/tools/EAV/demo/contractSearchContent'
);

?>