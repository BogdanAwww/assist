import * as React from 'react';
import Button from '@/common/views/button/button';
import BackgroundMain from '@/common/views/background-main/background-main';
import {translates} from '@/common/views/translates-provider/translates-provider';

class MainPage extends React.Component {
	render(): React.ReactNode {
		return (
			<BackgroundMain>
				<Button url="/signin" text={translates.buttons.enter} />
			</BackgroundMain>
		);
	}
}

export default MainPage;
